// functions/src/services/chatService.ts
import { callDeepSeek } from "./deepseekService";

export async function callDeepSeekChat(
  systemPrompt: string,
  history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  _apiKey?: string // kept for interface compatibility
): Promise<{ reply: string }> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((msg) => ({
      role: (msg.role === "model" ? "assistant" : "user") as "system" | "user" | "assistant",
      content: msg.parts[0].text,
    })),
  ];

  const reply = await callDeepSeek(messages, { temperature: 0.7 });
  return { reply };
}
