// Header cache CDN + mem-cache sederhana (per instance)
const mem = globalThis.__MEM_CACHE__ || (globalThis.__MEM_CACHE__ = new Map());

export function setCacheHeader(res, sMaxAge = 300, swr = 86400) {
  res.setHeader("Cache-Control", `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`);
}
export function getFromMem(key) {
  const v = mem.get(key);
  if (!v) return null;
  if (Date.now() > v.exp) { mem.delete(key); return null; }
  return v.val;
}
export function setToMem(key, val, ttlSec = 300) {
  mem.set(key, { val, exp: Date.now() + ttlSec * 1000 });
}
