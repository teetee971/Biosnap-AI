export function partnerOverrideUrl(name, fallback) {
  const map = {
    'botanic': import.meta.env.VITE_AFF_URL_BOTANIC,
    'truffaut': import.meta.env.VITE_AFF_URL_TRUFFAUT,
    'bakker': import.meta.env.VITE_AFF_URL_BAKKER,
    'manomano': import.meta.env.VITE_AFF_URL_MANOMANO,
    'amazon': import.meta.env.VITE_AFF_URL_AMAZON,
  };
  const key = name.toLowerCase().split(' ')[0]; // 'Botanic (FR)' -> 'botanic'
  return map[key] || fallback;
}

export function withUTM(url, extra = {}) {
  try {
    const u = new URL(url);
    const src = import.meta.env.VITE_DEFAULT_UTM_SOURCE || 'biosnap';
    const med = import.meta.env.VITE_DEFAULT_UTM_MEDIUM || 'affiliate';
    const camp = import.meta.env.VITE_DEFAULT_UTM_CAMPAIGN || 'default';
    const aff = import.meta.env.VITE_DEFAULT_AFF_ID;
    const params = new URLSearchParams(u.search);
    params.set('utm_source', src);
    params.set('utm_medium', med);
    params.set('utm_campaign', camp);
    if (aff) params.set('aff_id', aff);
    Object.entries(extra).forEach(([k,v]) => params.set(k, v));
    u.search = params.toString();
    return u.toString();
  } catch { return url; }
}

export async function logClick(payload) {
  const url = import.meta.env.VITE_CLICK_WEBHOOK;
  try {
    const entry = { ...payload, ts: new Date().toISOString() };
    const key = 'biosnap_clicks';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(entry);
    localStorage.setItem(key, JSON.stringify(list).slice(-5000));
    if (url) {
      await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(entry) });
    }
  } catch(e) { /* silent */ }
}
