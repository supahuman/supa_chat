import fetch from "node-fetch";

// Minimal Resend sender; replace with official SDK if preferred
export default async function sendEmailHandler(action, context) {
  const { params = {} } = action;
  const { to, subject, text, html, from = process.env.EMAIL_FROM } = params;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }
  if (!from) throw new Error("EMAIL_FROM not configured");
  if (!to) throw new Error("Missing 'to' in params");
  if (!subject) throw new Error("Missing 'subject' in params");

  const body = {
    from,
    to,
    subject,
    html: html || undefined,
    text: text || undefined,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend error: ${res.status} ${errText}`);
  }
  const data = await res.json();
  return { messageId: data.id };
}
