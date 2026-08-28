// functions/src/services/deepseekService.ts


const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callDeepSeek(
  messages: DeepSeekMessage[],
  options: { jsonMode?: boolean; temperature?: number; maxRetries?: number } = {}
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is missing from environment");
  }

  const payload: any = {
    model: "deepseek-chat",
    messages,
    temperature: options.temperature ?? 0.1,
  };

  if (options.jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  let lastError: Error | null = null;
  const retries = options.maxRetries ?? 2;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as any;
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("DeepSeek returned empty content");
      }

      return content;
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("DeepSeek call failed after retries");
}
