export function modelLabel(model: string) {
  if (!model || model === "env:LLM_MODEL") return "Free model";
  if (model === "Groq" || model === "Gemini" || model === "NVIDIA") return `${model} (when a key is set)`;
  return model;
}
