import React, { useState, useEffect, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '../lib/firebase/config';
import { sanitizeHTML } from '../lib/utils/sanitize';
import { moderateContent } from '../lib/utils/moderate';

// Inline SVG icons — no external lucide-react dep required (keeps bundle small)
const Icon = {
  X: (p: any) => <svg viewBox="0 0 24 24" width={p.size ?? 20} height={p.size ?? 20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={p.className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Bot: (p: any) => <svg viewBox="0 0 24 24" width={p.size ?? 22} height={p.size ?? 22} fill="none" stroke="currentColor" strokeWidth="2" className={p.className}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/><path d="M12 7V11"/><path d="M8 7c0-2.2 1.8-4 4-4s4 1.8 4 4"/></svg>,
  Send: (p: any) => <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={p.className}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Loader: (p: any) => <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} fill="none" stroke="currentColor" strokeWidth="2" className={(p.className||"")+" animate-spin"} style={{animation:"spin 0.8s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.2-8.6"/></svg>,
  Check: (p: any) => <svg viewBox="0 0 24 24" width={p.size ?? 30} height={p.size ?? 30} fill="none" stroke="currentColor" strokeWidth="2" className={p.className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Arrow: (p: any) => <svg viewBox="0 0 24 24" width={p.size ?? 16} height={p.size ?? 16} fill="none" stroke="currentColor" strokeWidth="2" className={p.className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Sparkles: (p: any) => <svg viewBox="0 0 24 24" width={p.size ?? 18} height={p.size ?? 18} fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className}><path d="M12 2l1.4 4.2L17.6 7.6 13.4 9 12 13.2 10.6 9 6.4 7.6l4.2-1.4L12 2z"/><path d="M19 13l1 2.2 2.2 1-2.2 1L19 19.2 18 17.2l-2.2-1 2.2-1L19 13z"/><path d="M5 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/></svg>,
};

interface Message { role: 'user' | 'bot'; text: string; }
type FlowStep = 'greet' | 'business' | 'timeline' | 'budget' | 'contact' | 'done' | 'ai';
interface Option { value: string; label: string; }

const OPTIONS: Record<FlowStep, Option[]> = {
  greet: [
    { value: 'search', label: 'Find me on Google & AI' },
    { value: 'whatsapp', label: 'Sell more on WhatsApp' },
    { value: 'website', label: 'A modern website' },
    { value: 'marketing', label: 'Marketing & content' },
    { value: 'other', label: 'Something else' },
  ],
  business: [
    { value: 'local', label: 'Local shop or service' },
    { value: 'online', label: 'Online business' },
    { value: 'pro', label: 'Professional practice' },
    { value: 'hospitality', label: 'Restaurant or hospitality' },
    { value: 'other', label: 'Other' },
  ],
  timeline: [
    { value: 'month', label: 'This month' },
    { value: 'quarter', label: 'Within 3 months' },
    { value: 'exploring', label: 'Just exploring' },
  ],
  budget: [
    { value: 'r5', label: 'Under R5,000' },
    { value: 'r15', label: 'R5,000 – R15,000' },
    { value: 'r50', label: 'R15,000 – R50,000' },
    { value: 'unsure', label: 'Not sure yet' },
  ],
  contact: [], done: [], ai: [],
};

const SERVICE_LABELS: Record<string, string> = {
  search: 'Find me on Google & AI',
  whatsapp: 'Sell more on WhatsApp',
  website: 'A modern website',
  marketing: 'Marketing & content',
};
const BUDGET_LABELS: Record<string, string> = {
  r5: 'Under R5,000', r15: 'R5,000 – R15,000', r50: 'R15,000 – R50,000', unsure: 'Not sure yet',
};
const QUESTIONS: Partial<Record<FlowStep, string>> = {
  greet: 'Hi, I’m the <strong>Smart Marketing assistant</strong>.<br/>Let’s find the right help for your business — just tap an option below.',
  business: 'Great choice. <strong>Which best describes your business?</strong>',
  timeline: 'Perfect. <strong>How soon would you like to get started?</strong>',
  budget: 'Almost there. <strong>What budget are you working with?</strong>',
  contact: 'You’re all set — last thing, we just need somewhere to send your plan. It takes 10 seconds.',
};
const NEXT_STEP: Partial<Record<FlowStep, FlowStep>> = { greet: 'business', business: 'timeline', timeline: 'budget', budget: 'contact' };
const escapeHTML = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'bot', text: QUESTIONS.greet! }]);
  const [step, setStep] = useState<FlowStep>('greet');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactWa, setContactWa] = useState('');
  const [contactError, setContactError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, step, pendingOption]);
  const botSay = (text: string) => setMessages(prev => [...prev, { role: 'bot', text }]);
  const userSay = (text: string) => setMessages(prev => [...prev, { role: 'user', text }]);

  const advance = (option: Option) => {
    if (pendingOption || loading) return;
    setPendingOption(option.value);
    setTimeout(() => {
      setPendingOption(null);
      if (step === 'greet' && option.value === 'other') {
        userSay(option.label);
        botSay('No problem. Ask me anything about your business and I’ll do my best to help — type below.');
        setStep('ai'); return;
      }
      if (step === 'greet') setAnswers(prev => ({ ...prev, service: option.value }));
      else if (step === 'business') setAnswers(prev => ({ ...prev, business: option.label }));
      else if (step === 'timeline') setAnswers(prev => ({ ...prev, timeline: option.label }));
      else if (step === 'budget') setAnswers(prev => ({ ...prev, budget: option.value }));
      userSay(option.label);
      const next = NEXT_STEP[step];
      if (next) { botSay(QUESTIONS[next]!); setStep(next); }
    }, 260);
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactWa.trim()) { setContactError('Please add your name and WhatsApp number.'); return; }
    if (loading) return;
    setContactError(''); setLoading(true);
    userSay(`${contactName.trim()} · ${contactWa.trim()}`);
    try {
      if (!firebaseFunctions) throw new Error("Functions not ready");
      const submitLead = httpsCallable(firebaseFunctions, 'submitChatbotLead');
      await submitLead({
        name: contactName.trim(), whatsapp: contactWa.trim(),
        service: SERVICE_LABELS[answers.service] || 'General enquiry',
        business: answers.business || null, timeline: answers.timeline || null, budget: BUDGET_LABELS[answers.budget] || null,
      });
      setStep('done');
      botSay(`<p style="text-align:center;margin:0 0 10px;"><span style="display:inline-flex;align-items:center;gap:8px;font-weight:800;color:#22c55e;font-size:15px;">✓ Done!</span></p><p>Thanks, <strong>${escapeHTML(contactName.trim())}</strong>. Your plan has been saved and a strategist will be in touch within 24 hours on <strong>${escapeHTML(contactWa.trim())}</strong>.</p>`);
    } catch {
      botSay('Something went wrong saving your details. Please try again, or message us on <a href="https://wa.me/27601016673" target="_blank" rel="noopener noreferrer">WhatsApp</a>.');
    } finally { setLoading(false); }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    if (userMsg.length > 500) { botSay('That message is a bit long. Could you keep it under 500 characters?'); return; }
    if (!moderateContent(userMsg).clean) { botSay('Let’s keep the conversation professional and on-topic — could you rephrase that?'); return; }
    setInput(''); userSay(userMsg); setLoading(true);
    try {
      if (!firebaseFunctions) throw new Error("Functions not ready");
      const hunterChatCall = httpsCallable(firebaseFunctions, 'hunterChat');
      const response = await hunterChatCall({ message: userMsg, history: messages }) as any;
      const replyText = response.data?.reply || 'I didn’t quite catch that. Could you rephrase?';
      botSay(replyText);
    } catch {
      botSay('I hit a temporary connection issue. Please retry, or message us on <a href="https://wa.me/27601016673" target="_blank" rel="noopener noreferrer">WhatsApp</a>.');
    } finally { setLoading(false); }
  };

  const resetFlow = () => {
    setMessages([{ role: 'bot', text: QUESTIONS.greet! }]); setStep('greet'); setAnswers({}); setContactName(''); setContactWa(''); setContactError('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
        className="fixed bottom-6 right-6 z-[150] bg-yellow-500 text-black p-0 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-110 transition-transform w-14 h-14 overflow-hidden flex items-center justify-center"
      >
        {open ? <Icon.X size={24} /> : <Icon.Bot size={26} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[150] w-[calc(100vw-3rem)] sm:w-80 md:w-96 bg-[#0a0a0a] border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[640px] animate-fade-in">
          <div className="bg-black px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-yellow-500/15 flex items-center justify-center">
                <Icon.Sparkles size={18} className="text-yellow-500" />
              </div>
              <div>
                <span className="block font-bold text-white text-[13px] leading-tight uppercase tracking-wider">Smart Marketing AI</span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500 leading-tight">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online — WhatsApp + Web
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-black/50" style={{ minHeight: 280 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] min-w-0 px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-yellow-500 text-black font-medium rounded-br-md' : 'bg-gray-900 text-gray-200 rounded-bl-md'}`}
                  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(m.text) }}
                />
              </div>
            ))}

            {!['ai', 'done'].includes(step) && OPTIONS[step].length > 0 && (
              <div className="flex flex-col gap-2.5 pl-1">
                {OPTIONS[step].map(opt => (
                  <button key={opt.value} onClick={() => advance(opt)} disabled={!!pendingOption}
                    className="group flex items-center justify-between gap-3 text-left px-4 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-gray-100 text-sm font-semibold hover:border-yellow-500 hover:text-white hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60">
                    {opt.label}
                    {pendingOption === opt.value ? <Icon.Loader size={16} className="text-yellow-500" /> : <Icon.Arrow size={16} className="text-gray-600 group-hover:text-yellow-500" />}
                  </button>
                ))}
              </div>
            )}

            {step === 'contact' && (
              <form onSubmit={submitContact} className="flex flex-col gap-2.5 pl-1">
                <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Your name"
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-white text-sm placeholder:text-gray-600 focus:border-yellow-500 outline-none" />
                <input value={contactWa} onChange={e => setContactWa(e.target.value)} placeholder="WhatsApp number (e.g. 060 101 6673)" inputMode="tel"
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-white text-sm placeholder:text-gray-600 focus:border-yellow-500 outline-none" />
                {contactError && <p className="text-red-400 text-xs">{contactError}</p>}
                <button type="submit" disabled={loading}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl bg-yellow-500 text-black font-black uppercase text-xs tracking-widest hover:bg-yellow-400 disabled:opacity-60">
                  {loading ? <><Icon.Loader size={15} /> Sending…</> : 'Send my plan'}
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="flex flex-col items-center gap-3 py-2 pl-1">
                <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center"><Icon.Check size={30} className="text-green-500" /></div>
                <button onClick={() => { setOpen(false); setTimeout(() => window.location.assign('/audit'), 0); }}
                  className="text-xs font-bold text-yellow-500 hover:text-white uppercase tracking-widest">Run the free online business health check →</button>
                <button onClick={resetFlow} className="text-[11px] text-gray-500 hover:text-white underline">Start a new enquiry</button>
              </div>
            )}

            {loading && step === 'ai' && (
              <div className="flex justify-start"><div className="flex items-center gap-2 bg-gray-900 text-gray-400 text-xs px-4 py-3 rounded-2xl"><Icon.Loader size={13} /> Typing…</div></div>
            )}
            <div ref={scrollRef} />
          </div>

          {step === 'ai' && (
            <form onSubmit={sendMessage} className="px-4 py-3 bg-gray-900/40 border-t border-gray-800 flex gap-2 items-center">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your question…"
                className="flex-1 bg-black text-white text-sm px-4 py-3 rounded-2xl border border-gray-800 focus:border-yellow-500 outline-none min-w-0" disabled={loading} />
              <button type="submit" disabled={loading || !input.trim()} aria-label="Send message"
                className="w-11 h-11 bg-yellow-500 text-black rounded-2xl flex items-center justify-center hover:bg-yellow-400 disabled:opacity-50 shrink-0">
                <Icon.Send size={16} />
              </button>
            </form>
          )}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
};
export default Chatbot;
