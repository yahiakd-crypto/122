/* ─────────────────────────────────────────────────────────────────────
   COST ESTIMATION — approximate per-token prices (USD per 1M tokens).
   Unknown models fall back to sensible averages. Estimates only.
   ───────────────────────────────────────────────────────────────────── */

const PRICING = {
  // OpenAI
  "gpt-4o": { in: 2.5, out: 10 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4.1": { in: 2, out: 8 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
  "o3-mini": { in: 1.1, out: 4.4 },
  "o4-mini": { in: 1.1, out: 4.4 },
  "gpt-4-turbo": { in: 10, out: 30 },
  // Anthropic
  "claude-3-7-sonnet-latest": { in: 3, out: 15 },
  "claude-3-5-sonnet-latest": { in: 3, out: 15 },
  "claude-3-5-haiku-latest": { in: 0.8, out: 4 },
  "claude-3-opus-latest": { in: 15, out: 75 },
  "claude-3-haiku": { in: 0.25, out: 1.25 },
  // Gemini
  "gemini-2.5-pro": { in: 1.25, out: 10 },
  "gemini-2.5-flash": { in: 0.3, out: 2.5 },
  "gemini-1.5-pro": { in: 1.25, out: 10 },
  "gemini-1.5-flash": { in: 0.075, out: 0.3 },
  // OpenRouter (path-suffixed names)
  "google/gemini-2.5-pro": { in: 1.25, out: 10 },
  "google/gemini-2.5-flash": { in: 0.3, out: 2.5 },
  "anthropic/claude-3.7-sonnet": { in: 3, out: 15 },
  "anthropic/claude-3.5-sonnet": { in: 3, out: 15 },
  "openai/gpt-4o": { in: 2.5, out: 10 },
  "openai/gpt-4o-mini": { in: 0.15, out: 0.6 },
  "meta-llama/llama-3.3-70b-instruct": { in: 0.2, out: 0.6 },
  "mistralai/mistral-large": { in: 2, out: 6 },
  "deepseek/deepseek-chat": { in: 0.27, out: 1.1 },
  // NVIDIA-hosted
  "meta/llama-3.3-70b-instruct": { in: 0.5, out: 0.9 },
  "deepseek-ai/deepseek-r1": { in: 1.2, out: 1.8 },
  "mistralai/mistral-large-2-instruct": { in: 0.4, out: 0.4 },
  "qwen/qwen2.5-72b-instruct": { in: 0.4, out: 0.9 },
};

const DEFAULT_PRICE = { in: 0.5, out: 1.5 };

export function estimateCostUsd(model, inputTokens, outputTokens) {
  const p = PRICING[model] || PRICING[model.split("/").slice(-1)[0]] || DEFAULT_PRICE;
  const usd = (inputTokens / 1e6) * p.in + (outputTokens / 1e6) * p.out;
  return { input: p.in, output: p.out, usd: round(usd) };
}

export function round(n) {
  return Math.round(n * 10000) / 10000;
}