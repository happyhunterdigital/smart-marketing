// functions/src/services/whatsappFlow.ts
// Guided conversational multi-step form for WhatsApp (progressive disclosure).
// One question at a time, one-click answers via native reply buttons,
// contact info requested last, green-checkmark confirmation at the end.
import * as admin from "firebase-admin";
import axios from "axios";
import { FieldValue } from "firebase-admin/firestore";
import { WHATSAPP_TOKEN, PHONE_NUMBER_ID, ADMIN_NUMBER } from "../config";
import { relayAuditToCrm } from "./crmRelay";

type FlowStep =
  | "need"
  | "business"
  | "timeline"
  | "budget"
  | "contact_name"
  | "contact_wa"
  | "done";

interface FlowState {
  step: FlowStep;
  answers: Record<string, string>;
}

const TRIGGERS = ["menu", "start", "options", "help", "get started", "start over", "begin"];

// Text shortcuts accepted at button steps (WhatsApp allows max 3 buttons)
const NEED_SHORTCUTS: Record<string, string> = {
  marketing: "marketing",
  content: "marketing",
  check: "audit",
  health: "audit",
  audit: "audit",
};
const BUSINESS_SHORTCUTS: Record<string, string> = {
  other: "Other",
  hospitality: "Restaurant or hospitality",
  restaurant: "Restaurant or hospitality",
};
const TIMELINE_SHORTCUTS: Record<string, string> = {
  exploring: "Just exploring",
  now: "This month",
};
const BUDGET_SHORTCUTS: Record<string, string> = {
  unsure: "Not sure yet",
};

const SERVICE_LABELS: Record<string, string> = {
  search: "Find me on Google & AI",
  whatsapp: "Sell more on WhatsApp",
  website: "Modern website",
  marketing: "Marketing & content",
  audit: "Free online health check",
};

const BUDGET_LABELS: Record<string, string> = {
  r5: "Under R5,000",
  r15: "R5,000 – R15,000",
  r50: "R15,000 – R50,000",
  unsure: "Not sure yet",
};

async function sendText(to: string, body: string) {
  await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    to,
    text: { body },
  }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
}

async function sendButtons(to: string, body: string, buttons: { id: string; title: string }[], footer?: string) {
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: { buttons: buttons.map(b => ({ type: "reply", reply: b })) },
    },
  };
  if (footer) {
    (payload.interactive as any).footer = { text: footer };
  }
  await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, payload, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
  });
}

async function saveSession(from: string, flow: FlowState) {
  await admin.firestore().collection("whatsapp_sessions").doc(from).set(
    { flow, lastUpdated: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

async function saveLead(from: string, answers: Record<string, string>, name: string, reach: string) {
  const db = admin.firestore();
  const isPhone = /\+?\d{8,}/.test(reach);
  const isEmail = /@/.test(reach);
  await db.collection("leads").add({
    name,
    whatsapp: isPhone ? reach : null,
    email: isEmail ? reach : null,
    service: SERVICE_LABELS[answers.service] || "General enquiry",
    business: answers.business || null,
    timeline: answers.timeline || null,
    budget: BUDGET_LABELS[answers.budget] || null,
    source: "WhatsApp Chatbot",
    timestamp: FieldValue.serverTimestamp(),
  });

  const auditDomain = (isEmail ? reach.split("@")[1] : null)
    || (answers.business ? answers.business.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".co.za" : "whatsapp.smartmarketing.local");
  void relayAuditToCrm({
    domain: auditDomain,
    companyName: answers.business || null,
    contactName: name,
    contactEmail: isEmail ? reach : null,
    contactPhone: isPhone ? reach : from,
  });

  const alertText = `NEW WHATSAPP LEAD\n\nFROM: ${name}\nSERVICE: ${SERVICE_LABELS[answers.service] || "General enquiry"}\nBUSINESS: ${answers.business || "n/a"}\nTIMELINE: ${answers.timeline || "n/a"}\nBUDGET: ${BUDGET_LABELS[answers.budget] || "n/a"}\nCONTACT: ${reach}\n\nFollow up now!`;
  try {
    await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: ADMIN_NUMBER,
      text: { body: alertText },
    }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
  } catch (err) {
    console.error("WhatsApp flow admin alert failed:", err);
  }
}

async function clearFlow(from: string) {
  await admin.firestore().collection("whatsapp_sessions").doc(from).set(
    { flow: FieldValue.delete() },
    { merge: true }
  );
}

async function sendStep(from: string, flow: FlowState) {
  const { step } = flow;

  if (step === "need") {
    await sendButtons(
      from,
      "Let’s find the right help for your business. What do you need most?",
      [
        { id: "search", title: "Find me on Google & AI" },
        { id: "whatsapp", title: "Sell more on WhatsApp" },
        { id: "website", title: "Modern website" },
      ],
      "Reply “marketing” or “check” for those options"
    );
    return;
  }
  if (step === "business") {
    await sendButtons(
      from,
      "Which best describes your business?",
      [
        { id: "local", title: "Local shop or service" },
        { id: "online", title: "Online business" },
        { id: "pro", title: "Professional practice" },
      ],
      "Reply “other” or “hospitality”"
    );
    return;
  }
  if (step === "timeline") {
    await sendButtons(
      from,
      "How soon would you like to get started?",
      [
        { id: "month", title: "This month" },
        { id: "quarter", title: "Within 3 months" },
        { id: "exploring", title: "Just exploring" },
      ]
    );
    return;
  }
  if (step === "budget") {
    await sendButtons(
      from,
      "Almost there. What budget are you working with?",
      [
        { id: "r5", title: "Under R5,000" },
        { id: "r15", title: "R5k – R15k" },
        { id: "r50", title: "R15k – R50k" },
      ],
      "Reply “unsure”"
    );
    return;
  }
  if (step === "contact_name") {
    await sendText(from, "Last step — what’s your name? 🙂");
    return;
  }
  if (step === "contact_wa") {
    await sendText(from, "And the best number or email for us to reach you?");
    return;
  }
  if (step === "done") {
    await sendText(from, "✅ *You’re all set!*\n\nYour details have been saved and a strategist will reach out within 24 hours.");
    await clearFlow(from);
    return;
  }
}

export async function resetFlowForUser(from: string): Promise<void> {
  const initial: FlowState = { step: "need", answers: {} };
  await saveSession(from, initial);
  await sendStep(from, initial);
}

export async function handleFlowMessage(params: {
  from: string;
  text: string | null;
  buttonId: string | null;
}): Promise<{ handled: boolean }> {
  const { from, text, buttonId } = params;
  const db = admin.firestore();
  const sessionRef = db.collection("whatsapp_sessions").doc(from);
  const sessionDoc = await sessionRef.get();
  const flow = sessionDoc.exists ? (sessionDoc.data()?.flow as FlowState | undefined) : undefined;

  const lowerText = (text || "").trim().toLowerCase();

  // Start the guided flow
  if (!flow && lowerText && TRIGGERS.some(t => lowerText.includes(t))) {
    await resetFlowForUser(from);
    return { handled: true };
  }

  // If user typed something unrelated while the flow is idle, let AI handle it
  if (!flow) return { handled: false };

  const { step, answers } = flow;
  let decided = false;

  if (step === "need") {
    let value = buttonId || NEED_SHORTCUTS[lowerText] || null;
    if (value) {
      answers.service = value;
      flow.step = "business";
      decided = true;
    }
  } else if (step === "business") {
    const selected = buttonId
      ? ({ local: "Local shop or service", online: "Online business", pro: "Professional practice" } as Record<string, string>)[buttonId]
      : BUSINESS_SHORTCUTS[lowerText];
    if (selected) {
      answers.business = selected;
      flow.step = "timeline";
      decided = true;
    }
  } else if (step === "timeline") {
    const selected = buttonId
      ? ({ month: "This month", quarter: "Within 3 months", exploring: "Just exploring" } as Record<string, string>)[buttonId]
      : TIMELINE_SHORTCUTS[lowerText];
    if (selected) {
      answers.timeline = selected;
      flow.step = "budget";
      decided = true;
    }
  } else if (step === "budget") {
    const selected = buttonId
      ? ({ r5: "r5", r15: "r15", r50: "r50" } as Record<string, string>)[buttonId]
      : BUDGET_SHORTCUTS[lowerText];
    if (selected) {
      answers.budget = selected;
      flow.step = "contact_name";
      decided = true;
    }
  } else if (step === "contact_name") {
    if (text && text.trim()) {
      answers.name = text.trim();
      flow.step = "contact_wa";
      decided = true;
    }
  } else if (step === "contact_wa") {
    if (text && text.trim()) {
      answers.reach = text.trim();
      flow.step = "done";
      decided = true;
    }
  } else if (step === "done") {
    decided = true;
  }

  if (!decided) {
    // Unknown input at a button step — gently re-prompt
    await sendStep(from, flow);
    return { handled: true };
  }

  if (step === "contact_wa" && flow.step === "done") {
    await saveLead(from, answers, answers.name || "Unnamed", answers.reach || from);
  }

  await saveSession(from, flow);
  await sendStep(from, flow);
  return { handled: true };
}