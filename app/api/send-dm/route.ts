import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  recipientIgUserId: z.string().min(1, "Instagram user id is required"),
  message: z.string().min(1, "Message body is required"),
  tag: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

type RequestPayload = z.infer<typeof requestSchema>;

const buildGraphPayload = ({ recipientIgUserId, message, metadata, tag }: RequestPayload) => {
  const payload: Record<string, unknown> = {
    messaging_product: "instagram",
    recipient: {
      id: recipientIgUserId,
    },
    message: {
      text: message,
    },
  };

  if (tag) payload.tag = tag;
  if (metadata) payload.metadata = metadata;

  return payload;
};

export async function POST(request: Request) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const senderId = process.env.INSTAGRAM_SENDER_ID;
  const graphVersion = process.env.META_GRAPH_VERSION ?? "v19.0";

  if (!accessToken || !senderId) {
    return NextResponse.json(
      {
        error: "Missing Instagram messaging credentials. Configure INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_SENDER_ID.",
      },
      { status: 500 }
    );
  }

  let body: RequestPayload;
  try {
    const json = await request.json();
    body = requestSchema.parse(json);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid request payload",
        details: error instanceof Error ? error.message : error,
      },
      { status: 400 }
    );
  }

  const payload = buildGraphPayload(body);

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${senderId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          typeof result === "object" && result !== null && "error" in result
            ? // @ts-expect-error best-effort
              result.error?.message ?? "Failed to dispatch Instagram message"
            : "Failed to dispatch Instagram message",
        details: result,
      },
      { status: response.status }
    );
  }

  return NextResponse.json({ success: true, result });
}
