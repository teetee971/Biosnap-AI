// /api/stats  (GET)
// Renvoie { day, clicks } pour le jour demandé (ou hier par défaut)
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" };
export const onRequestOptions = () => new Response(null, { headers: cors });

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const day = url.searchParams.get("day") || new Date(Date.now()-24*3600*1000).toISOString().slice(0,10);
  const { keys } = await env.BIOSNAP_KV.list({ prefix: `click:${day}:` });
  return new Response(JSON.stringify({ day, clicks: keys.length }), { headers: { "Content-Type": "application/json", ...cors } });
};
