import { loadKeys } from "./_ytKeys.js";

// state rotator (per instance)
const S = globalThis.__YT_ROTATOR__ || (globalThis.__YT_ROTATOR__ = {
  keys: loadKeys(),
  i: 0,
  deadUntil: {} // key -> timestamp ms
});

function untilResetMs() {
  // Perkiraan reset kuota harian 08:00 UTC
  const now = new Date();
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 0, 0));
  if (now > reset) reset.setUTCDate(reset.getUTCDate() + 1);
  return reset - now;
}
function nextKey() {
  const n = S.keys.length;
  if (!n) throw new Error("No YouTube API keys configured");
  for (let step = 0; step < n; step++) {
    const idx = (S.i + step) % n;
    const key = S.keys[idx];
    if ((S.deadUntil[key] || 0) < Date.now()) { S.i = (idx + 1) % n; return key; }
  }
  const key = S.keys[S.i]; S.i = (S.i + 1) % n; return key;
}
function markDead(key, ms) { S.deadUntil[key] = Date.now() + Math.max(ms, 60_000); }

export async function ytFetchV3(endpoint, params = {}, opts = {}) {
  const base = "https://www.googleapis.com/youtube/v3/";
  const tries = Math.max(1, S.keys.length) + 2;
  let lastErr;

  for (let t = 0; t < tries; t++) {
    const key = nextKey();
    const url = new URL(base + endpoint);
    Object.entries({ ...params, key }).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));

    const r = await fetch(url, { ...opts });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }

    if (r.ok) return data;

    const body = typeof data === "string" ? data : JSON.stringify(data);
    const quotaHit = r.status === 403 && /quota|dailyLimit|userRateLimit/i.test(body);
    if (quotaHit) { markDead(key, untilResetMs()); lastErr = new Error("Quota exceeded"); continue; }
    if (r.status === 429) { markDead(key, 15 * 60 * 1000); lastErr = new Error("Rate limited"); continue; }

    // error lain → jangan rotasi
    throw new Error(`YouTube API error ${r.status}: ${body}`);
  }
  throw lastErr || new Error("All keys exhausted");
}
