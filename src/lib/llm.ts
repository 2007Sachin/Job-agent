import { BUSY_MESSAGE, acquireGlobalSlot, draftText, promptCacheId, queueTimeoutMs, readCachedDraft, retryAfterMs, writeCachedDraft } from "./llm-gate";

type ChatMessage = { content?: string | null; reasoning_content?: string | null };

type ChatResponse = {
  choices?: { message?: ChatMessage }[];
  error?: { message?: string };
};

export function llmConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY && process.env.LLM_BASE_URL && process.env.LLM_MODEL);
}

export function fallbackConfigured() {
  return Boolean(process.env.LLM_FALLBACK_API_KEY && process.env.LLM_FALLBACK_BASE_URL && process.env.LLM_FALLBACK_MODEL);
}

/** Provider nicknames such as "Groq" are not model ids. */
export function apiModel(label?: string): string | undefined {
  if (!label) return undefined;
  if (label.includes("/") || /^(gpt-|gemini-|llama|claude-|meta-)/i.test(label)) return label;
  return undefined;
}

type Provider = { base: string; key: string; model: string };

function providers(model?: string): Provider[] {
  const primary: Provider = {
    base: process.env.LLM_BASE_URL!.replace(/\/$/, ""),
    key: process.env.LLM_API_KEY!,
    model: model || process.env.LLM_MODEL!,
  };
  if (!fallbackConfigured()) return [primary];
  return [
    primary,
    {
      base: process.env.LLM_FALLBACK_BASE_URL!.replace(/\/$/, ""),
      key: process.env.LLM_FALLBACK_API_KEY!,
      model: process.env.LLM_FALLBACK_MODEL!,
    },
  ];
}

async function postChat(provider: Provider, system: string, user: string, temperature: number, deadline: number) {
  let attempt = 0;
  while (true) {
    const response = await fetch(`${provider.base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        temperature,
        max_tokens: 2048,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (response.status === 429 && attempt < 2 && Date.now() < deadline) {
      const wait = Math.min(retryAfterMs(response.headers.get("retry-after")), deadline - Date.now());
      if (wait <= 0) throw new Error(BUSY_MESSAGE);
      await new Promise((resolve) => setTimeout(resolve, wait));
      attempt += 1;
      continue;
    }
    const json = (await response.json().catch(() => ({}))) as ChatResponse;
    if (!response.ok) throw new Error(json.error?.message || `LLM request failed (${response.status})`);
    const text = draftText(json.choices?.[0]?.message);
    if (!text) throw new Error("LLM returned an empty draft");
    return text;
  }
}

export async function complete(
  user: string,
  system: string,
  options?: { model?: string; temperature?: number; userId?: string; shareable?: boolean },
): Promise<string> {
  const model = options?.model || process.env.LLM_MODEL || "";
  const cacheId = promptCacheId({ model, system, user, userId: options?.userId, shareable: options?.shareable });
  const cached = await readCachedDraft(cacheId);
  if (cached) return cached;
  await acquireGlobalSlot();
  const deadline = Date.now() + queueTimeoutMs();
  const temperature = options?.temperature ?? 0.4;
  let last = new Error("LLM request failed");
  for (const provider of providers(options?.model)) {
    try {
      const text = await postChat(provider, system, user, temperature, deadline);
      await writeCachedDraft(cacheId, text);
      return text;
    } catch (error) {
      last = error instanceof Error ? error : last;
      if (last.message === BUSY_MESSAGE) break;
    }
  }
  throw last;
}
