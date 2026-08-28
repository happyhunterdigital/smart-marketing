import axios from "axios";
import { PHONE_NUMBER_ID, WHATSAPP_TOKEN, BASE_URL, ADMIN_NUMBER } from "../config";

export const sendWhatsAppText = async (to: string, text: string) => {
  return axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    to,
    text: { body: text }
  }, {
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
  });
};

export const sendWhatsAppDoc = async (to: string, type: 'gbp' | 'services') => {
  const docName = type === 'gbp' ? "AI & GBP Zero Clicks Revolutions Guide" : "Smart Marketing Service Guide";
  const fileName = type === 'gbp' ? "hhd-gbp-zero-clicks.pdf" : "hhd-service-guide.pdf";
  const viewerUrl = `${BASE_URL}/assets/${fileName}`;
  return axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "cta_url",
      header: { type: "text", text: docName },
      body: { text: "Your requested document is ready for secure access." },
      footer: { text: "happyhunterdigital.com" },
      action: {
        name: "cta_url",
        parameters: { display_text: "View Document", url: viewerUrl }
      }
    }
  }, {
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
  });
};

export const sendAdminAlert = async (businessName: string, email: string, phone: string, score: number) => {
  const alertText = `🚨*NEW HIGH-INTENT LEAD DETECTED*\n\n*Entity:* ${businessName}\n*Contact:* ${email}\n*WhatsApp:* ${phone || 'Not Provided'}\n*Survival Score:* ${score}/100\n\n*Directive:* Initiate contact protocol immediately.`;
  return sendWhatsAppText(ADMIN_NUMBER, alertText);
};

/**
 * Sends the full 7-pillar audit result directly to the client's WhatsApp number.
 * Called after a successful performAudit run.
 */
export const sendAuditResultToClient = async (
  to: string,
  businessName: string,
  score: number,
  summary: string,
  truths: string[],
  gbpStatus: string
): Promise<void> => {
  if (!to) return;

  const scoreEmoji = score >= 70 ? "✅" : score >= 40 ? "⚠️" : "🚨";

  const pillarLabels = [
    "⚡ Performance & CWV",
    "🔒 SSL & Security",
    "🔍 SEO Meta & Content",
    "🤖 Schema & AEO",
    "📱 Mobile",
    "📍 Google Business Profile",
    "🌐 Social Proof & Entity"
  ];

  const pillarLines = truths.map((t, i) => {
    const label = pillarLabels[i] || `Pillar ${i + 1}`;
    return `*${label}*\n${t}`;
  }).join("\n\n");

  const message = [
    `🎯 *Hunter AI — 7-Pillar Digital Audit*`,
    `*Business:* ${businessName}`,
    `*Google Business Profile:* ${gbpStatus}`,
    ``,
    `${scoreEmoji} *Digital Survival Score: ${score}/100*`,
    ``,
    `📋 *Intelligence Summary*`,
    summary,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    pillarLines,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `💡 *Need an in-depth analysis?*`,
    `Contact *motsumitl@happyhunterdigital.com*`,
    ``,
    `💡 Want to fix these issues? Reply *YES* or visit happyhunterdigital.com`
  ].join("\n");

  try {
    await sendWhatsAppText(to, message);
  } catch (err: any) {
    console.error("[sendAuditResultToClient] WhatsApp delivery failed:", err.message);
  }
};
