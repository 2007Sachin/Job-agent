type ChatResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

export function llmConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY && process.env.LLM_BASE_URL && process.env.LLM_MODEL);
}

export async function complete(user: string, system: string): Promise<string> {
  const base = process.env.LLM_BASE_URL!.replace(/\/$/, "");
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const json = (await response.json()) as ChatResponse;
  if (!response.ok) {
    throw new Error(json.error?.message || `LLM request failed (${response.status})`);
  }
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("LLM returned an empty draft");
  return text;
}
