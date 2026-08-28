import DashboardLayout from '../../components/DashboardLayout';
import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Chatbot } from '../../components/Chatbot';

export default function WhatsappControl() {
  const [chatInput, setChatInput] = useState('');
  const [chatReply, setChatReply] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [leadName, setLeadName] = useState('');
  const [leadWa, setLeadWa] = useState('');
  const [leadService, setLeadService] = useState('Find me on Google & AI');
  const [leadResult, setLeadResult] = useState<string | null>(null);
  const [leadLoading, setLeadLoading] = useState(false);

  const webhookUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL ||
    'https://us-central1-<project>.cloudfunctions.net/whatsappWebhook';

  const callHunterChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatError(null);
    setChatReply(null);
    try {
      const fn = httpsCallable(getFunctions(), 'hunterChat');
      const res: any = await fn({ message: chatInput.trim(), history: [] });
      setChatReply(res.data?.reply || JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setChatError(err?.message || 'hunterChat failed — check GEMINI_API_KEY secret & deploy.');
    } finally {
      setChatLoading(false);
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadWa.trim()) return;
    setLeadLoading(true);
    setLeadResult(null);
    try {
      const fn = httpsCallable(getFunctions(), 'submitChatbotLead');
      await fn({ name: leadName.trim(), whatsapp: leadWa.trim(), service: leadService });
      setLeadResult('Lead saved → check Firestore `leads` + admin WhatsApp + CRM relay.');
    } catch (err: any) {
      setLeadResult(`Error: ${err?.message || 'submitChatbotLead failed'}`);
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="wa-page">
        <div className="page-header">
          <div>
            <div className="category-tag">META CLOUD API · OFFICIAL · NO BAN RISK</div>
            <h1 className="page-title">WhatsApp Bot — Control Center</h1>
            <p className="page-subtitle">
              Same bot that powers <code>happyhunterdigital.com</code>. Meta Cloud webhook, Flow buttons, AI fallback (Gemini/DeepSeek), and CRM mirror. Replaces OpenWA/Baileys.
            </p>
          </div>
          <span className="live-badge">● LIVE — whatsapp-bot</span>
        </div>

        {/* Webhook config — copy-paste into Meta Dashboard */}
        <div className="card">
          <h3>1 — Meta Webhook (plug & play)</h3>
          <p className="hint">
            Deploy functions, then paste this URL into <strong>Meta App → WhatsApp → Configuration → Webhook</strong>. Verify Token = <code>VERIFY_TOKEN</code> you set as a Firebase secret. Subscribe to <code>messages</code>.
          </p>
          <div className="webhook-row">
            <code className="webhook-url">{webhookUrl}</code>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(webhookUrl)}>Copy</button>
          </div>
          <div className="code-block">
            <pre>{`# Verify (emulator or prod)
curl "${webhookUrl}?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=123"
# Expected: 200 + "123" (fails 403 if VERIFY_TOKEN mismatch)

# Inbound is HMAC-verified via WHATSAPP_APP_SECRET (X-Hub-Signature-256) — fail-closed 401
# Outbound CRM: POST https://<region>-<project>.cloudfunctions.net/sendFromCrm
#   Header: x-crm-bot-secret: $CRM_BOT_SECRET  Body: { to: "27...", text: "…" }`}</pre>
          </div>

          <div className="env-grid">
            <div className="env-item">
              <strong>WHATSAPP_TOKEN</strong> / META_SYSTEM_TOKEN
              <span>System user token (Graph API)</span>
            </div>
            <div className="env-item">
              <strong>PHONE_NUMBER_ID</strong>
              <span>Meta → WhatsApp → API Setup</span>
            </div>
            <div className="env-item">
              <strong>VERIFY_TOKEN</strong>
              <span>You choose — must match Meta</span>
            </div>
            <div className="env-item">
              <strong>WHATSAPP_APP_SECRET</strong>
              <span>App → Settings → Basic</span>
            </div>
            <div className="env-item">
              <strong>GEMINI_API_KEY</strong>
              <span>gemini-3.7-flash (audit + WA fallback)</span>
            </div>
            <div className="env-item">
              <strong>CRM_*</strong>
              <span>Optional — fail-open if missing</span>
            </div>
          </div>
          <p className="hint small">
            Set via <code>firebase functions:secrets:set WHATSAPP_TOKEN PHONE_NUMBER_ID VERIFY_TOKEN WHATSAPP_APP_SECRET GEMINI_API_KEY</code> — never commit real tokens. Local emulator uses <code>functions/.env</code> (see <code>functions/.env.example</code>).
          </p>
        </div>

        {/* Architecture */}
        <div className="card">
          <h3>2 — How it routes</h3>
          <pre className="arch">{`User WA → Meta → whatsappWebhook (onRequest)
  ├─ whatsappFlow (need→business→timeline→budget→contact → whatsapp_sessions) — trigger: menu/start/options
  ├─ verified_claims vector (Gemini embedding cosine) — media-aware reply
  └─ Gemini fallback (WA_SYSTEM_PROMPT) — [SEND_DOC_GBP|SERVICES] → CTA button + secure_access_sessions (24h)
Web Chatbot (this widget →) → hunterChat (onCall) → Gemini + secure doc link BASE_URL/view/guide?id=…
  └─ submitChatbotLead → leads + admin WA + relayToCrm (/internal/whatsapp/intake)
CRM → sendFromCrm (x-crm-bot-secret) → Meta Graph send → outbound relay`}</pre>
        </div>

        {/* Testers */}
        <div className="two-col">
          <div className="card">
            <h3>3 — Test hunterChat (web bot brain)</h3>
            <p className="hint">Calls the same callable the floating Chatbot uses. No WhatsApp needed.</p>
            <form onSubmit={callHunterChat} className="form">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="e.g. What do you charge for WhatsApp Automation?" />
              <button type="submit" disabled={chatLoading || !chatInput.trim()} className="submit-btn">
                {chatLoading ? 'Thinking…' : 'Ask hunterChat'}
              </button>
            </form>
            {chatReply && <div className="reply-box">{chatReply}</div>}
            {chatError && <div className="alert error">{chatError}</div>}
          </div>

          <div className="card">
            <h3>4 — Test submitChatbotLead</h3>
            <p className="hint">Writes to <code>leads</code> + pings admin WhatsApp. Mirrors Chatbot contact step.</p>
            <form onSubmit={submitLead} className="form">
              <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Your name" required />
              <input value={leadWa} onChange={(e) => setLeadWa(e.target.value)} placeholder="WhatsApp e.g. 27601016673" required />
              <select value={leadService} onChange={(e) => setLeadService(e.target.value)}>
                <option>Find me on Google & AI</option>
                <option>Sell more on WhatsApp</option>
                <option>A modern website</option>
                <option>Marketing & content</option>
                <option>General enquiry</option>
              </select>
              <button type="submit" disabled={leadLoading} className="submit-btn">
                {leadLoading ? 'Sending…' : 'Submit test lead'}
              </button>
            </form>
            {leadResult && <div className={leadResult.startsWith('Error') ? 'alert error' : 'alert ok'}>{leadResult}</div>}
          </div>
        </div>

        {/* Live Chatbot preview */}
        <div className="card">
          <h3>5 — Live Chatbot (floating widget)</h3>
          <p className="hint">
            The golden button at bottom-right is the actual <code>Chatbot.tsx</code> (greet→business→timeline→budget→contact→done + AI). Open it and run the flow — it hits <code>hunterChat</code> + <code>submitChatbotLead</code> live.
          </p>
          <div className="chatbot-note">
            If you don't see it, check <code>apps/web/pages/_app.tsx:6</code> mounts <code>dynamic(Chatbot)</code> (SSR false).
          </div>
        </div>

        {/* Secrets template */}
        <div className="card">
          <h3>6 — Secrets template (copy → set)</h3>
          <pre className="code-block small">{`firebase functions:secrets:set WHATSAPP_TOKEN --data-file <(echo -n "EAA...")
firebase functions:secrets:set PHONE_NUMBER_ID --data-file <(echo -n "123...")
firebase functions:secrets:set VERIFY_TOKEN --data-file <(echo -n "hhd_verify_$(openssl rand -hex 8)")
firebase functions:secrets:set WHATSAPP_APP_SECRET --data-file <(echo -n "...")
firebase functions:secrets:set GEMINI_API_KEY --data-file <(echo -n "...")
firebase functions:secrets:set PLACES_API_KEY --data-file <(echo -n "...")
# optional
firebase functions:secrets:set CRM_INGEST_URL --data-file <(echo -n "https://your-crm.example.com")
firebase functions:secrets:set CRM_INGEST_SECRET --data-file <(echo -n "...")
firebase functions:secrets:set CRM_BOT_SECRET --data-file <(echo -n "...")

# tell the frontend where the webhook lives (after deploy)
# apps/web/.env.local → NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL=https://us-central1-<project>.cloudfunctions.net/whatsappWebhook
`}</pre>
        </div>

        <style jsx>{`
          .wa-page { display: flex; flex-direction: column; gap: 20px; }
          .category-tag { font-size: 11px; font-weight: 800; color: #25D366; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
          .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
          .page-title { font-size: 26px; font-weight: 800; color: #fff; margin: 0 0 6px; letter-spacing: -0.5px; }
          .page-subtitle { font-size: 13.5px; color: #8E8E93; margin: 0; max-width: 760px; line-height: 1.5; }
          .live-badge { background: rgba(37,211,102,0.12); color: #25D366; border: 1px solid rgba(37,211,102,0.25); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; white-space: nowrap; }
          .card { background: #0D0D0D; border: 1px solid #1F1F1F; border-radius: 12px; padding: 24px; }
          .card h3 { margin: 0 0 10px; font-size: 14px; color: #fff; font-weight: 800; }
          .hint { font-size: 12.5px; color: #9ca3af; margin: 0 0 12px; line-height: 1.6; }
          .hint.small { font-size: 11px; color: #6b7280; margin-top: 10px; }
          .webhook-row { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; }
          .webhook-url { flex: 1; background: #141414; border: 1px solid #262626; padding: 10px 12px; border-radius: 8px; color: #EAB308; font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
          .copy-btn { background: #25D366; color: #050505; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer; }
          .code-block { background: #0a0a0a; border: 1px solid #262626; border-radius: 8px; padding: 14px; overflow: auto; }
          .code-block pre { margin: 0; color: #d1d5db; font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
          .code-block.small pre { font-size: 11px; }
          .env-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-top: 14px; }
          .env-item { background: #141414; border: 1px solid #262626; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 3px; }
          .env-item strong { color: #fff; font-size: 12px; }
          .env-item span { color: #8E8E93; font-size: 11px; }
          .arch { background: #141414; border: 1px solid #262626; border-radius: 8px; padding: 14px; color: #d1d5db; font-size: 11.5px; line-height: 1.6; white-space: pre-wrap; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
          .form { display: flex; flex-direction: column; gap: 10px; }
          input, select { background: #141414; border: 1px solid #262626; color: #fff; padding: 11px 12px; border-radius: 8px; font-size: 13px; }
          input:focus, select:focus { outline: none; border-color: #25D366; box-shadow: 0 0 10px rgba(37,211,102,0.2); }
          .submit-btn { background: #25D366; color: #050505; border: none; padding: 11px 16px; border-radius: 8px; font-weight: 800; font-size: 13px; cursor: pointer; }
          .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
          .reply-box { margin-top: 12px; background: #141414; border: 1px solid #262626; border-radius: 8px; padding: 12px; color: #d1d5db; font-size: 12.5px; line-height: 1.6; white-space: pre-wrap; }
          .alert { margin-top: 10px; padding: 10px 12px; border-radius: 8px; font-size: 12.5px; }
          .alert.error { background: rgba(239,68,68,0.12); border: 1px solid #EF4444; color: #FCA5A5; }
          .alert.ok { background: rgba(37,211,102,0.12); border: 1px solid #25D366; color: #86efac; }
          .chatbot-note { background: rgba(234,179,8,0.08); border: 1px solid rgba(234,179,8,0.25); border-radius: 8px; padding: 10px 12px; color: #fde68a; font-size: 12px; }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
