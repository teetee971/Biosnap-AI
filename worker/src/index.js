export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'POST') {
      const body = await request.json().catch(()=>({}));
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const rec = JSON.stringify({ ...body, path: url.pathname, ts: new Date().toISOString() });
      await env.BIOSNAP_KV.put(key, rec, { expirationTtl: 60*60*24*90 }); // 90 jours
      return new Response(JSON.stringify({ ok: true }), { headers:{'Content-Type':'application/json'} });
    }
    if (url.pathname === '/health') {
      return new Response('ok', { status: 200 });
    }
    return new Response('Not found', { status: 404 });
  }
}
