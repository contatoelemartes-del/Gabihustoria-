// Ponte entre o site e a API do Claude (Cloudflare Pages Function).
// A chave da Anthropic fica só aqui, guardada como segredo na Cloudflare
// (ANTHROPIC_API_KEY). O site precisa mandar a senha do app (APP_PASSWORD)
// para usar, assim ninguém mais gasta o seu crédito.
import Anthropic from "@anthropic-ai/sdk";

// Qual modelo cada tipo de pedido usa, e quanto ele "pensa" antes de escrever.
const MODELS = {
  complex: { model: "claude-opus-5-5", effort: "medium", fallbacks: true }, // narrador
  default: { model: "claude-sonnet-5-5", effort: "medium", fallbacks: true }, // narrador no modo econômico, DMs, posts
  quick: { model: "claude-haiku-5-5", effort: "low", fallbacks: false }, // respostas curtas nas redes
};
const MAX_BODY = 4 * 1024 * 1024;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function errorCode(e) {
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return "bad_api_key";
  if (e instanceof Anthropic.RateLimitError) return "rate_limited";
  if (e instanceof Anthropic.BadRequestError) return "invalid_request";
  if (e instanceof Anthropic.APIUserAbortError) return "cancelled";
  if (e instanceof Anthropic.APIError) return "upstream_error";
  return "upstream_error";
}

function toMessages(raw, images, stable) {
  if (!Array.isArray(raw) || !raw.length) throw new Error("messages");
  const msgs = raw.slice(-60).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 200000),
  }));
  if (msgs[0].role !== "user") throw new Error("first");
  // Regras e ficha (primeira mensagem) quase não mudam: guarda em cache para pagar menos.
  if (stable && msgs.length > 1) {
    msgs[0] = { role: "user", content: [{ type: "text", text: msgs[0].content, cache_control: { type: "ephemeral" } }] };
  }
  if (Array.isArray(images) && images.length) {
    const last = msgs[msgs.length - 1];
    const blocks = images.slice(0, 5).map((img) => ({
      type: "image",
      source: { type: "base64", media_type: String(img.type || "image/jpeg"), data: String(img.data || "") },
    }));
    const text = typeof last.content === "string" ? [{ type: "text", text: last.content }] : last.content;
    last.content = [...blocks, ...text];
  }
  return msgs;
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY || !env.APP_PASSWORD) return json({ error: "not_configured" }, 500);
  if (request.headers.get("x-app-key") !== env.APP_PASSWORD) return json({ error: "bad_password" }, 401);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return json({ error: "too_large" }, 413);

  let body;
  try { body = await request.json(); } catch { return json({ error: "invalid_request" }, 400); }
  const cfg = MODELS[body.tier] || MODELS.default;
  let messages;
  try { messages = toMessages(body.messages, body.images, !!body.stable); } catch { return json({ error: "invalid_request" }, 400); }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}) });
  const params = {
    model: cfg.model,
    max_tokens: 16000,
    output_config: { effort: cfg.effort },
    messages,
  };
  // Se o modelo recusar por engano, a API tenta de novo num modelo reserva.
  if (cfg.fallbacks) { params.betas = ["server-side-fallback-2026-07-01"]; params.fallbacks = "default"; }

  const enc = new TextEncoder();
  const stream = client.beta.messages.stream(params);
  request.signal?.addEventListener?.("abort", () => stream.abort());

  const out = new ReadableStream({
    async start(ctrl) {
      const send = (obj) => { try { ctrl.enqueue(enc.encode(JSON.stringify(obj) + "\n")); } catch {} };
      stream.on("text", (delta) => send({ t: delta }));
      try {
        const msg = await stream.finalMessage();
        if (msg.stop_reason === "refusal") send({ error: "refused" });
        else {
          const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
          send({ done: true, text, truncated: msg.stop_reason === "max_tokens" });
        }
      } catch (e) {
        send({ error: errorCode(e), message: e instanceof Anthropic.APIError ? e.message : undefined });
      }
      try { ctrl.close(); } catch {}
    },
    cancel() { stream.abort(); },
  });
  return new Response(out, { headers: { "content-type": "application/x-ndjson", "cache-control": "no-store" } });
}

export function onRequestGet() {
  return json({ ok: true });
}
