// /api/track  (POST)
// Enregistre un clic en KV (même logique que le Worker)
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
export const onRequestOptions = () => new Response(null, { headers: cors });

export const onRequestPost = async ({ request, env }) => {
  const body = (await request.json().catch(() => ({}))) || {};
  const now = new Date();
  const day = now.toISOString().slice(0,10);
  const key = `click:${day}:${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const rec = {
    ...body,
    ts: now.toISOString(),
    ua: request.headers.get("user-agent") || "",
    ip: request.headers.get("cf-connecting-ip") || "",
  };
  await env.BIOSNAP_KV.put(key, JSON.stringify(rec), { expirationTtl: 60*60*24*90 });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", ...cors } });
};
