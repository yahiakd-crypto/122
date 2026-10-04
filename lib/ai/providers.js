/* ─────────────────────────────────────────────────────────────────────
   AI PROVIDER LAYER — abstraction over OpenAI / Anthropic / Gemini /
   OpenRouter / NVIDIA / Custom. All network calls happen server-side.
   ───────────────────────────────────────────────────────────────────── */

export class AiError extends Error {
  constructor(message, code = "provider_error", status = 500) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.status = status;
  }
}

const FRIENDLY = {
  invalid_key: "Invalid API key or unauthorized.",
  rate_limit: "Rate limit hit. Wait a moment and retry.",
  timeout: "The AI provider timed out.",
  network: "Network error reaching the AI provider.",
  invalid_model: "The model name is invalid for this provider.",
  empty_response: "The AI provider returned an empty response.",
  provider_error: "The AI provider couldn't complete this request.",
  config_error: "AI parameters are not configured. Open AI Parameters.",
};

export function friendlyError(code) {
  return FRIENDLY[code] || FRIENDLY.provider_error;
}

function normalizeUsage(provider, data) {
  if (provider === "anthropic") {
    return {
      inputTokens: data?.usage?.input_tokens || 0,
      outputTokens: data?.usage?.output_tokens || 0,
    };
  }
  if (provider === "gemini") {
    return {
      inputTokens: data?.usageMetadata?.promptTokenCount || 0,
      outputTokens: data?.usageMetadata?.candidatesTokenCount || 0,
    };
  }
  return {
    inputTokens: data?.usage?.prompt_tokens || 0,
    outputTokens: data?.usage?.completion_tokens || 0,
    totalTokens: data?.usage?.total_tokens || 0,
  };
}

function extractText(provider, data) {
  if (provider === "anthropic") {
    return (data?.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  }
  if (provider === "gemini") {
    return (data?.candidates || [])
      .map((c) => (c?.content?.parts || []).map((p) => p.text || "").join(""))
      .join("\n");
  }
  return data?.choices?.[0]?.message?.content || "";
}

function classifyError(err) {
  const status = err.status || err.statusCode || 0;
  const body = String(err.body || err.message || "").toLowerCase();
  if (status === 401 || status === 403 || body.includes("api key") || body.includes("unauthorized") || body.includes("invalid key")) {
    return new AiError("Invalid API key or unauthorized.", "invalid_key", status);
  }
  if (status === 402 || body.includes("insufficient credits") || body.includes("payment required")) {
    return new AiError(
      "This provider needs credits for this model (or Max Tokens is set too high for your balance). Add credits in your provider account, or switch to a free model like meta-llama/llama-3.3-70b-instruct.",
      "invalid_credits",
      402
    );
  }
  if (status === 429 || body.includes("rate limit") || body.includes("quota")) {
    return new AiError("Rate limit hit.", "rate_limit", 429);
  }
  if (err.code === "ECONNABORTED" || /timeout/i.test(body) || /timed ?out/i.test(body)) {
    return new AiError("Provider timed out.", "timeout", 408);
  }
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED" || err.code === "EAI_AGAIN" || err.code === "ECONNRESET") {
    return new AiError("Network error.", "network", 0);
  }
  if (body.includes("model") && (body.includes("not found") || body.includes("does not exist") || body.includes("invalid"))) {
    return new AiError("Invalid model for this provider.", "invalid_model", status);
  }
  let realError = "";
  try {
    const parsed = JSON.parse(body);
    realError = parsed.error?.message || parsed.message || "";
  } catch(e) {
    realError = body.substring(0, 150);
  }
  
  const finalError = realError ? `${FRIENDLY.provider_error} Details: ${realError}` : FRIENDLY.provider_error;
  return new AiError(finalError, "provider_error", status);
}

export class BaseOpenAICompatProvider {
  constructor(name, { apiKey, baseUrl } = {}) {
    this.name = name;
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || "").replace(/\/+$/, "");
  }

  async chat({ messages, model, temperature, maxTokens, topP, timeout, systemPrompt }) {
    let merged = messages;
    if (systemPrompt) merged = [{ role: "system", content: systemPrompt }, ...merged];

    const url = `${this.baseUrl}/chat/completions`;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model,
          messages: merged,
          temperature: temperature != null ? temperature : 0.7,
          max_tokens: maxTokens || 4000,
          top_p: topP != null ? topP : 0.95,
        }),
        signal: AbortSignal.timeout((timeout || 120) * 1000),
      });
    } catch (err) {
      throw classifyError({ ...err, code: err.name === "TimeoutError" ? "ECONNABORTED" : err.cause?.code || err.code });
    }

    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!res.ok) {
      throw classifyError({ status: res.status, body: text });
    }
    const content = extractText(this.name, data);
    if (!content || !content.trim()) {
      const reason = data?.choices?.[0]?.finish_reason;
      const hadReasoning = data?.choices?.[0]?.message?.reasoning && data.choices[0].message.reasoning.length > 0;
      if (hadReasoning || reason === "length") {
        throw new AiError(
          "The model used its whole output budget on thinking and returned no content. Increase Max Tokens (thinking models need extra headroom).",
          "empty_response",
          500
        );
      }
      throw new AiError("The AI provider returned an empty response.", "empty_response", 500);
    }
    return { content, ...normalizeUsage(this.name, data) };
  }
}

export class OpenAIProvider extends BaseOpenAICompatProvider {
  constructor(opts) { super("openai", opts); }
  headers() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` };
  }
}

export class OpenRouterProvider extends BaseOpenAICompatProvider {
  constructor(opts) { super("openrouter", opts); }
  headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "HTTP-Referer": "https://ai-product-lab.local",
      "X-Title": "AI Product Research & CRO Lab",
    };
  }
}

export class NVIDIAProvider extends BaseOpenAICompatProvider {
  constructor(opts) { super("nvidia", opts); }
  headers() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` };
  }
}

export class DeepseekProvider extends BaseOpenAICompatProvider {
  constructor(opts) { super("deepseek", opts); }
  headers() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` };
  }
}

export class CustomProvider extends BaseOpenAICompatProvider {
  constructor(opts) { super("custom", opts); }
  headers() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` };
  }
}

export class GeminiProvider {
  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = ((baseUrl || "https://generativelanguage.googleapis.com") + "/v1beta").replace(/\/+$/, "");
  }

  async chat({ messages, model, temperature, maxTokens, topP, timeout, systemPrompt }) {
    const system = [systemPrompt].filter(Boolean).map((p) => ({ parts: [{ text: p }], role: "user" }));
    const history = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = `${this.baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [system, ...history],
          generationConfig: {
            temperature: temperature != null ? temperature : 0.7,
            maxOutputTokens: maxTokens || 4000,
            topP: topP != null ? topP : 0.95,
          },
        }),
        signal: AbortSignal.timeout((timeout || 120) * 1000),
      });
    } catch (err) {
      throw classifyError({ ...err, code: err.name === "TimeoutError" ? "ECONNABORTED" : err.cause?.code || err.code });
    }
    const raw = await res.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
    if (!res.ok) {
      throw classifyError({ status: res.status, body: raw });
    }
    const content = extractText("gemini", data);
    if (!content || !content.trim()) {
      throw new AiError("The AI provider returned an empty response.", "empty_response", 500);
    }
    return { content, ...normalizeUsage("gemini", data) };
  }
}

export class AnthropicProvider {
  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = ((baseUrl || "https://api.anthropic.com") + "/v1").replace(/\/+$/, "");
  }

  async chat({ messages, model, temperature, maxTokens, topP, timeout, systemPrompt }) {
    const body = {
      model,
      max_tokens: Math.min(maxTokens || 4000, 32000),
      temperature: temperature != null ? temperature : 0.7,
      system: systemPrompt || "",
    };
    if (topP != null) body.top_p = topP;
    body.messages = messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

    let res;
    try {
      res = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout((timeout || 120) * 1000),
      });
    } catch (err) {
      throw classifyError({ ...err, code: err.name === "TimeoutError" ? "ECONNABORTED" : err.cause?.code || err.code });
    }
    const raw = await res.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
    if (!res.ok) {
      throw classifyError({ status: res.status, body: raw });
    }
    const content = extractText("anthropic", data);
    if (!content || !content.trim()) {
      throw new AiError("The AI provider returned an empty response.", "empty_response", 500);
    }
    return { content, ...normalizeUsage("anthropic", data) };
  }
}

export function buildProvider(providerName, { apiKey, baseUrl }) {
  switch (providerName) {
    case "openai":
      return new OpenAIProvider({ apiKey, baseUrl });
    case "openrouter":
      return new OpenRouterProvider({ apiKey, baseUrl });
    case "nvidia":
      return new NVIDIAProvider({ apiKey, baseUrl });
    case "deepseek":
      return new DeepseekProvider({ apiKey, baseUrl });
    case "gemini":
      return new GeminiProvider({ apiKey, baseUrl });
    case "anthropic":
      return new AnthropicProvider({ apiKey, baseUrl });
    case "custom":
      return new CustomProvider({ apiKey, baseUrl });
    default:
      throw new AiError("Unknown AI provider.", "config_error");
  }
}