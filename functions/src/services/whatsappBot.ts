// functions/src/services/whatsappBot.ts
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import { VERIFY_TOKEN, ADMIN_NUMBER, PHONE_NUMBER_ID, WHATSAPP_TOKEN } from "../config";
import { callDeepSeekChat } from "./chatService";
import { FieldValue } from "firebase-admin/firestore";
import { sendWhatsAppDoc } from "./whatsappService";
import { FULL_KNOWLEDGE_BASE } from "../data/servicesKnowledge";

export const whatsappWebhook = onRequest({
  secrets: ["DEEPSEEK_API_KEY"] // EXPLICIT RUNTIME SECRET PERMISSION
}, async (req, res) => {
  if (req.method === 'GET') {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
      res.status(200).send(req.query['hub.challenge']);
    } else {
      res.status(403).send('Verification failed');
    }
    return;
  }

  if (req.method === 'POST') {
    const db = admin.firestore();
    
    if (req.body?.object === 'whatsapp_business_account') {
      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message?.type === "system" && message.system?.type === "group_membership_change") {
        const newUser = message.from;
        const onboardingDoc = await db.collection("verified_claims").where("category", "==", "onboarding").limit(1).get();
        
        if (!onboardingDoc.empty) {
          const data = onboardingDoc.docs[0].data();
          const welcomeMessage = `Welcome to the Smart Marketing Tribe! 🚀\n\nWe are excited to have you.\n${data.content}\n\nIntroduce yourself once you're in!`;
          
          try {
            await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
              messaging_product: "whatsapp", to: newUser, text: { body: welcomeMessage }
            }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
          } catch (err) { 
            console.error("Onboarding Error", err); 
          }
        }
      } 
      else if (message && message.type === 'text') {
        const userText = message.text.body;
        const lowerText = userText.toLowerCase();
        const from = message.from;
        
        const claimsRef = db.collection('verified_claims');
        const snapshot = await claimsRef.where('keywords', 'array-contains', lowerText).limit(1).get();
        
        let botResponse = "";
        let mediaUrl = null;

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          
          if (data.category === "price" || data.category === "service") {
            await db.collection("prospects").doc(from).set({
              phone: from, interest: data.category, last_inquiry: userText,
              timestamp: FieldValue.serverTimestamp(), status: "new_lead"
            }, { merge: true });

            const alertText = `🚨 *NEW HIGH-VALUE LEAD* 🚨\n\n*From:* ${from}\n*Interested in:* ${data.category}\n*Message:* "${userText}"\n\nCheck Firestore now to follow up!`;
            
            try {
              await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
                messaging_product: "whatsapp", to: ADMIN_NUMBER, text: { body: alertText }
              }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
            } catch (err) { 
              console.error("Admin Alert Failed", err); 
            }
          }
          
          if (data.category === "onboarding") {
            botResponse = `🚀 *Welcome to the Smart Marketing Tribe!* 🚀\n\nWe are excited to have you.\n${data.content}\n\nIntroduce yourself once you're in!`;
          } else if (data.category === 'blog') {
            botResponse = `💡 *Insight Snippet:* ${data.snippet}\n\nRead the full article here: ${data.url}`;
          } else if (data.category === 'guide') {
            await sendWhatsAppDoc(from, 'gbp');
            res.status(200).send('EVENT_RECEIVED');
            return;
          } else {
            botResponse = `✅ *Official Info:* ${data.content || data.verified_answer}`;
          }
          mediaUrl = data.media_url;
        } 
        else {
          if (process.env.DEEPSEEK_API_KEY) {
            try {
              const sessionRef = db.collection('whatsapp_sessions').doc(from);
              const sessionDoc = await sessionRef.get();
              let history = sessionDoc.exists ? sessionDoc.data()?.history || [] : [];

              const systemPrompt = `You are the Official AI Assistant for Happy Hunter Digital.
Keep answers short (2-4 sentences max, except when listing all six categories), professional, and friendly. NO markdown asterisks.
${FULL_KNOWLEDGE_BASE}

CONVERSATION FLOW:
- If someone asks a general "what do you offer" / "how much" question without naming a category, do NOT send prices. List the six service categories with their one-line descriptions (Digital Marketing, Web Development, SEO & AI Search Optimisation, GBP Management, WhatsApp Automation, Automation & Chatbots).
- Once they name or clearly imply a category (e.g. "I need a chatbot" = Automation & Chatbots), reply using only that category's detailed pricing. Don't dump unrelated prices.
- If they explicitly ask for full pricing or everything up front, give it to them.
RULES:
- Use ONLY the info above. Never invent prices or services.
- Pricing is always "starting from" - for an exact quote, point users to happyhunterdigital.com/audit or to book via WhatsApp/email.
- If asked about something not listed above, say you'll get the team to follow up rather than guessing.`;

              const formattedHistory = history.map((m: any) => ({
                role: m.role === 'bot' ? 'model' : 'user',
                parts: [{ text: m.text }]
              }));
              formattedHistory.push({ role: 'user', parts: [{ text: userText }] });

              const aiRes = await callDeepSeekChat(systemPrompt, formattedHistory);
              botResponse = aiRes.reply.replace(/\*/g, '').trim();

              history.push({ role: 'user', text: userText });
              history.push({ role: 'bot', text: botResponse });
              if (history.length > 10) history = history.slice(history.length - 10);

              await sessionRef.set({ history, lastUpdated: FieldValue.serverTimestamp() });
            } catch (err) {
              console.error("WA LLM Error:", err);
              botResponse = "The automated response system is temporarily offline.";
            }
          } else {
            botResponse = "Neural link offline. Please visit happyhunterdigital.com.";
          }
        }

        if (mediaUrl) {
          try {
            await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
              messaging_product: "whatsapp", to: from, type: "image",
              image: { link: mediaUrl, caption: botResponse }
            }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
            res.status(200).send('EVENT_RECEIVED');
            return;
          } catch (mediaError) { 
            console.error("Media Send Error:", mediaError); 
          }
        }

        try {
          await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
            messaging_product: "whatsapp", to: from, text: { body: botResponse }
          }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
        } catch (error: any) {
          console.error("WhatsApp API Transmission Error:", error.response?.data || error.message);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
    return;
  }
  
  res.status(404).send();
});
